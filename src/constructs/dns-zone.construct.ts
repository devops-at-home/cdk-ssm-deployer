import { ResourceProps } from 'aws-cdk-lib';
import {
    ARecord,
    IPublicHostedZone,
    NsRecord,
    PublicHostedZone,
    RecordTarget,
} from 'aws-cdk-lib/aws-route53';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

interface DNSZoneProps extends ResourceProps {
    instanceName: string;
    environment: string;
    paramPrefix?: string;
}

export class DNSZone extends Construct {
    public readonly parentHostedZone: IPublicHostedZone;
    public readonly childHostedZone: IPublicHostedZone;

    constructor(scope: Construct, id: string, props: DNSZoneProps) {
        super(scope, id);

        const { instanceName, environment } = props;

        const paramPrefix = props.paramPrefix ?? '/edgeDevices';

        const parentZoneId = StringParameter.fromStringParameterName(
            this,
            'StringParamParentZoneId',
            `${paramPrefix}/infra/parentZoneId`
        ).stringValue;

        const parentZoneName = StringParameter.fromStringParameterName(
            this,
            'StringParamParentZoneName',
            `${paramPrefix}/infra/parentZoneName`
        ).stringValue;

        const tsIP = StringParameter.fromStringParameterName(
            this,
            'StringParamTsIP',
            `${paramPrefix}/instanceName/tsIP`
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
            recordName: zoneName,
            zone: this.parentHostedZone,
        });

        new ARecord(this, 'ChildARecord', {
            target: RecordTarget.fromIpAddresses(tsIP),
            recordName: `*.${zoneName}`,
            zone: this.childHostedZone,
        });
    }
}
