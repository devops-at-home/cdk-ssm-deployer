import { ResourceProps } from 'aws-cdk-lib';
import { IPublicHostedZone, NsRecord, PublicHostedZone } from 'aws-cdk-lib/aws-route53';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

interface DNSZoneProps extends ResourceProps {
    instanceName: string;
    environment: string;
}

export class DNSZone extends Construct {
    public readonly parentHostedZone: IPublicHostedZone;
    public readonly childHostedZone: IPublicHostedZone;

    constructor(scope: Construct, id: string, props: DNSZoneProps) {
        super(scope, id);

        const { instanceName, environment } = props;

        const parentZoneId = StringParameter.fromStringParameterName(
            this,
            'StringParamParentZoneId',
            '/edgeDevices/infra/parentZoneId'
        ).stringValue;

        const parentZoneName = StringParameter.fromStringParameterName(
            this,
            'StringParamParentZoneName',
            '/edgeDevices/infra/parentZoneName'
        ).stringValue;

        const zoneName = `${instanceName}.${
            environment === 'test' ? 'test.' : ''
        }${parentZoneName}`;

        this.childHostedZone = new PublicHostedZone(this, 'ChildPublicHostedZone', {
            zoneName,
        });

        this.parentHostedZone = PublicHostedZone.fromPublicHostedZoneAttributes(
            this,
            'PublicHostedZone',
            {
                zoneName: parentZoneName,
                hostedZoneId: parentZoneId,
            }
        );

        new NsRecord(this, 'ParentNSRecord', {
            values: this.childHostedZone.hostedZoneNameServers!,
            zone: this.parentHostedZone,
        });
    }
}
