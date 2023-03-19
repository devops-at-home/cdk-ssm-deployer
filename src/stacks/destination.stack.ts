import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DNSZone } from '../constructs/dns-zone.construct';
import { SSMRole, SSMRoleConfig, SSMRoleProps } from '../constructs/ssm-role.construct';

interface DestinationStackProps extends SSMRoleConfig, StackProps {
    instanceName: string;
    environment: string;
}

export class DestinationStack extends Stack {
    public readonly roleName: string;
    constructor(scope: Construct, id: string, props: DestinationStackProps) {
        super(scope, id, props);

        const ssmRoleProps: SSMRoleProps = {
            ...props,
        };

        if (props.features.dns) {
            const { childHostedZone } = new DNSZone(this, 'DNSZone', {
                ...props,
            });
            ssmRoleProps.hostedZoneId = childHostedZone.hostedZoneId;
        }

        const { roleName } = new SSMRole(this, 'Role', ssmRoleProps);

        this.roleName = roleName;
    }
}
