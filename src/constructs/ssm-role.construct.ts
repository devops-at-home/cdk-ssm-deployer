import { Fn } from 'aws-cdk-lib';
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

export type SSMRoleConfig = {
    containers?: string[];
};

interface SSMRoleProps extends SSMRoleConfig {
    instanceName: string;
    environment: string;
}

export class SSMRole extends Construct {
    public readonly roleArn: string;
    constructor(scope: Construct, id: string, props: SSMRoleProps) {
        super(scope, id);

        const { instanceName, containers, environment } = props;

        const exportName = getBucketExportName(environment);

        const role = new Role(this, 'Role', {
            roleName: `SSMServiceRole-${instanceName}-${environment}`,
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

        if (containers) {
            containers.forEach((container) => {
                Repository.fromRepositoryName(this, container, container).grantPull(role);
            });
        }

        this.roleArn = role.roleArn;
    }
}
