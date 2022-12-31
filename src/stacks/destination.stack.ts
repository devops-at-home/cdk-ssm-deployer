import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SSMRole, SSMRoleConfig } from '../constructs/ssm-role.construct';

interface DestinationStackProps extends SSMRoleConfig, StackProps {
    instanceName: string;
    environment: string;
}

export class DestinationStack extends Stack {
    constructor(scope: Construct, id: string, props: DestinationStackProps) {
        super(scope, id, props);

        new SSMRole(this, 'Role', {
            ...props,
        });
    }
}
