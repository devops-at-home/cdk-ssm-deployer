import { CfnOutput } from 'aws-cdk-lib';
import {
    AwsCustomResource,
    AwsCustomResourcePolicy,
    PhysicalResourceId,
    PhysicalResourceIdReference,
} from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

export type SSMRegistrationProps = {
    instanceName: string;
    roleArn: string;
};

interface SSMRegistrationConfig extends SSMRegistrationProps {
    registrationLimit: number;
}

export class SSMRegistration extends Construct {
    constructor(scope: Construct, id: string, props: SSMRegistrationConfig) {
        super(scope, id);

        const { instanceName, roleArn, registrationLimit } = props;

        const response = new AwsCustomResource(this, 'CreateActivation', {
            policy: AwsCustomResourcePolicy.fromSdkCalls({
                resources: AwsCustomResourcePolicy.ANY_RESOURCE,
            }),
            onCreate: {
                action: 'createActivation',
                service: 'ssm',
                parameters: {
                    ExpirationDate: '2026-01-01T00:00:00',
                    RegistrationLimit: registrationLimit,
                    DefaultInstanceName: instanceName,
                    IamRole: roleArn,
                },
                physicalResourceId: PhysicalResourceId.fromResponse('ActivationId'),
            },
            onDelete: {
                action: 'deleteActivation',
                service: 'ssm',
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
