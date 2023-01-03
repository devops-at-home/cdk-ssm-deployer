import { CfnOutput } from 'aws-cdk-lib';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import {
    AwsCustomResource,
    AwsCustomResourcePolicy,
    PhysicalResourceId,
    PhysicalResourceIdReference,
} from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

export type SSMRegistrationProps = {
    instanceName: string;
    roleName: string;
};

export class SSMRegistration extends Construct {
    constructor(scope: Construct, id: string, props: SSMRegistrationProps) {
        super(scope, id);

        const { instanceName, roleName } = props;

        const role = new Role(this, 'AwsCustomResourceRole', {
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        });

        role.addToPolicy(
            new PolicyStatement({
                actions: ['iam:PassRole'],
                resources: ['*'],
            })
        );

        const response = new AwsCustomResource(this, 'CreateActivation', {
            role,
            policy: AwsCustomResourcePolicy.fromSdkCalls({
                resources: AwsCustomResourcePolicy.ANY_RESOURCE,
            }),
            logRetention: RetentionDays.ONE_MONTH,
            onCreate: {
                action: 'createActivation',
                service: 'SSM',
                parameters: {
                    DefaultInstanceName: instanceName,
                    IamRole: roleName,
                },
                physicalResourceId: PhysicalResourceId.fromResponse('ActivationId'),
            },
            onDelete: {
                action: 'deleteActivation',
                service: 'SSM',
                parameters: {
                    ActivationId: new PhysicalResourceIdReference(),
                },
            },
        });

        new CfnOutput(this, 'ActivationId', {
            value: response.getResponseField('ActivationId'),
            exportName: `SSMActId-${instanceName}`,
        });

        new CfnOutput(this, 'ActivationCode', {
            value: response.getResponseField('ActivationCode'),
            exportName: `SSMActCode-${instanceName}`,
        });
    }
}
