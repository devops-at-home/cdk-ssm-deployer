import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SSMRegistration, SSMRegistrationProps } from '../constructs/ssm-registration.construct';

interface RegistrationStackProps extends StackProps, SSMRegistrationProps {
    environment: string;
}

export class RegistrationStack extends Stack {
    constructor(scope: Construct, id: string, props: RegistrationStackProps) {
        super(scope, id, props);

        const { instanceName, roleArn, environment } = props;

        new SSMRegistration(this, 'SSMRegistration', {
            instanceName,
            roleArn,
            registrationLimit: environment === 'prod' ? 1 : 9999,
        });
    }
}
