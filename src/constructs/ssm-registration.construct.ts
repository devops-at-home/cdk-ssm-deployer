import { CfnOutput } from 'aws-cdk-lib';
import {
    AwsCustomResource,
    AwsCustomResourcePolicy,
    PhysicalResourceId,
} from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

export type SSMRegistrationProps = {
    instanceName: string;
    roleArn: string;
};

export class SSMRegistration extends Construct {
    constructor(scope: Construct, id: string, props: SSMRegistrationProps) {
        super(scope, id);

        const { instanceName, roleArn } = props;

        const response = new AwsCustomResource(this, 'CreateActivation', {
            policy: AwsCustomResourcePolicy.fromSdkCalls({
                resources: AwsCustomResourcePolicy.ANY_RESOURCE,
            }),
            onCreate: {
                action: 'createActivation',
                service: 'ssm',
                parameters: {
                    ExpirationDate: new Date(Date.now()), // TODO
                    RegistrationLimit: 1,
                    DefaultInstanceName: instanceName,
                    IamRole: roleArn,
                },
                physicalResourceId: PhysicalResourceId.fromResponse('ActivationId'),
            },
            onDelete: {
                action: 'deleteActivation',
                service: 'ssm',
                parameters: {
                    ActivationId: '', // TODO
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
