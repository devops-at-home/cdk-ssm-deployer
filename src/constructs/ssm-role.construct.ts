import { Aws, Fn } from 'aws-cdk-lib';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import {
    ManagedPolicy,
    Policy,
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
};

interface SSMRoleProps extends SSMRoleConfig {
    instanceName: string;
    environment: string;
}

const { REGION, ACCOUNT_ID } = Aws;

const paramRoot = '/edgeDevices';

export class SSMRole extends Construct {
    public readonly roleName: string;
    constructor(scope: Construct, id: string, props: SSMRoleProps) {
        super(scope, id);

        const { instanceName, containers, environment, features } = props;

        const exportName = getBucketExportName(environment);

        const role = new Role(this, 'Role', {
            roleName: `SSMServiceRole-${instanceName}`,
            assumedBy: new ServicePrincipal('ssm.amazonaws.com'),
            managedPolicies: [
                ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
            ],
            inlinePolicies: {
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
            },
        });

        // Permissions required for K8s
        if (features.k8s) {
            role.attachInlinePolicy(
                new Policy(this, 'Policy-k8s', {
                    policyName: `SSMServicePolicy-${instanceName}-k8s`,
                    statements: [
                        ...permissionsForEncryptedParam({
                            kms: true,
                            operation: 'put',
                            param: `${paramRoot}/${instanceName}/kubeconfig`,
                        }),
                    ],
                })
            );
        }

        // Permissions required for Tailscale
        if (features.ts) {
            role.attachInlinePolicy(
                new Policy(this, 'Policy-ts', {
                    policyName: `SSMServicePolicy-${instanceName}-ts`,
                    statements: [
                        ...permissionsForEncryptedParam({
                            kms: true,
                            operation: 'get',
                            param: `${paramRoot}/${instanceName}/tsState`,
                        }),
                        ...permissionsForEncryptedParam({
                            kms: true,
                            operation: 'put',
                            param: `${paramRoot}/${instanceName}/tsState`,
                        }),
                    ],
                })
            );
        }

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
            kmsAction: kms ? 'Decrypt' : undefined,
        });
    }
    // Path for put
    return ssmKms({
        param,
        ssmAction: 'PutParameter',
        kmsAction: kms ? 'Encrypt' : undefined,
    });
};

type ssmKmsProps = {
    param: string;
    ssmAction: 'PutParameter' | 'GetParameter';
    kmsAction?: 'Decrypt' | 'Encrypt';
};

export const ssmKms = (props: ssmKmsProps) => {
    return [
        new PolicyStatement({
            actions: [`ssm:${props.ssmAction}`],
            resources: [`arn:aws:ssm:${REGION}:${ACCOUNT_ID}parameter${props.param}`],
        }),
        new PolicyStatement({
            actions: [`kms:${props.kmsAction}`],
            resources: [`arn:aws:kms:${REGION}:${ACCOUNT_ID}:key/*`],
            conditions: {
                StringLike: {
                    'kms:RequestAlias': 'aws/ssm',
                },
            },
        }),
    ];
};
