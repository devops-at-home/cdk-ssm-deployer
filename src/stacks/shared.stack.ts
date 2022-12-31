import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket, BucketEncryption, IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface SharedStackProps extends StackProps {
    environment: string;
}

export class SharedStack extends Stack {
    public readonly bucket: IBucket;
    constructor(scope: Construct, id: string, props: SharedStackProps) {
        super(scope, id, props);

        const { environment } = props;

        const { bucketArn } = (this.bucket = new Bucket(this, 'Bucket', {
            encryption: BucketEncryption.S3_MANAGED,
        }));

        new CfnOutput(this, 'CfnOutput', {
            exportName: getBucketExportName(environment),
            value: bucketArn,
        });
    }
}

export const getBucketExportName = (environment: string) => {
    return `app-config-backup-bucket-${environment}`;
};
