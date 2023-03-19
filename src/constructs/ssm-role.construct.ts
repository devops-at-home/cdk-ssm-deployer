import { Aws, Fn } from 'aws-cdk-lib';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import {
    ManagedPolicy,
    PolicyDocument,
    PolicyStatement,
    Role,
    ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { getBucketExportName } from '../stacks/shared.stack';
import { Features } from '../types';

export type SSMRoleConfig = {
    containers?: string[];
    features: Features;
    paramPrefix?: string;
};

export interface SSMRoleProps extends SSMRoleConfig {
    instanceName: string;
    environment: string;
    hostedZoneId?: string;
}

const { REGION, ACCOUNT_ID } = Aws;

export class SSMRole extends Construct {
    public readonly roleName: string;
    constructor(scope: Construct, id: string, props: SSMRoleProps) {
        super(scope, id);

        const { instanceName, containers, environment, features, hostedZoneId } = props;

        const paramPrefix = props.paramPrefix ?? '/edgeDevices';

        const exportName = getBucketExportName(environment);

        const inlinePolicies: { [name: string]: PolicyDocument } = {
            backupBucket: new PolicyDocument({
                statements: [
                    new PolicyStatement({
                        actions: ['s3:ListBucket'],
                        resources: [Fn.importValue(exportName)],
                    }),
                    new PolicyStatement({
                        actions: ['s3:*Object'],
                        resources: [`${Fn.importValue(exportName)}/${instanceName}/*`],
                    }),
                ],
            }),
        };

        if (features.k8s) {
            inlinePolicies['k8s'] = new PolicyDocument({
                statements: [
                    ...permissionsForEncryptedParam({
                        kms: true,
                        operation: 'put',
                        param: `${paramPrefix}/${instanceName}/kubeconfig`,
                    }),
                ],
            });
        }

        if (features.ts) {
            inlinePolicies['ts'] = new PolicyDocument({
                statements: [
                    ...permissionsForEncryptedParam({
                        kms: false,
                        operation: 'get',
                        param: `${paramPrefix}/${instanceName}/tsState`,
                    }),
                    ...permissionsForEncryptedParam({
                        kms: false,
                        operation: 'put',
                        param: `${paramPrefix}/${instanceName}/tsState`,
                    }),
                ],
            });
        }

        if (typeof hostedZoneId !== undefined) {
            inlinePolicies['dns'] = new PolicyDocument({
                statements: [
                    new PolicyStatement({
                        actions: [
                            'route53:ListResourceRecordSets',
                            'route53:GetChange',
                            'route53:ChangeResourceRecordSets',
                        ],
                        resources: [
                            `arn:aws:route53:::hostedzone/${hostedZoneId}`,
                            'arn:aws:route53:::change/*',
                        ],
                    }),
                    new PolicyStatement({
                        actions: ['route53:ListHostedZonesByName', 'route53:ListHostedZones'],
                        resources: ['*'],
                    }),
                ],
            });
        }

        const role = new Role(this, 'Role', {
            roleName: `SSMServiceRole-${instanceName}`,
            assumedBy: new ServicePrincipal('ssm.amazonaws.com'),
            managedPolicies: [
                ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
            ],
            inlinePolicies,
        });

        if (containers) {
            containers.forEach((container) => {
                Repository.fromRepositoryName(this, container, container).grantPull(role);
            });
        }

        this.roleName = role.roleName;
    }
}

type PermissionsForEncryptedParamProps = {
    operation: 'get' | 'put';
    kms: boolean;
    param: string;
};

export const permissionsForEncryptedParam = (props: PermissionsForEncryptedParamProps) => {
    const { operation, kms, param } = props;
    if (operation === 'get') {
        return ssmKms({
            param,
            ssmAction: 'GetParameter',
            kmsAction: kms ? 'Decrypt' : false,
        });
    }
    // Path for put
    return ssmKms({
        param,
        ssmAction: 'PutParameter',
        kmsAction: kms ? 'Encrypt' : false,
    });
};

type ssmKmsProps = {
    param: string;
    ssmAction: 'PutParameter' | 'GetParameter';
    kmsAction: false | 'Decrypt' | 'Encrypt';
};

export const ssmKms = (props: ssmKmsProps) => {
    const statements = [
        new PolicyStatement({
            actions: [`ssm:${props.ssmAction}`],
            resources: [`arn:aws:ssm:${REGION}:${ACCOUNT_ID}:parameter${props.param}`],
        }),
    ];

    if (props.kmsAction) {
        statements.push(
            new PolicyStatement({
                actions: [`kms:${props.kmsAction}`],
                resources: [`arn:aws:kms:${REGION}:${ACCOUNT_ID}:key/*`],
                conditions: {
                    StringLike: {
                        'kms:RequestAlias': 'aws/ssm',
                    },
                },
            })
        );
    }

    return statements;
};
