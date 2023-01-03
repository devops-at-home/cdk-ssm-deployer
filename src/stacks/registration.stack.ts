import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SSMRegistration, SSMRegistrationProps } from '../constructs/ssm-registration.construct';

interface RegistrationStackProps extends StackProps, SSMRegistrationProps {}

export class RegistrationStack extends Stack {
    constructor(scope: Construct, id: string, props: RegistrationStackProps) {
        super(scope, id, props);

        const { instanceName, roleName } = props;

        new SSMRegistration(this, 'SSMRegistration', {
            instanceName,
            roleName,
        });
    }
}
