import { CfnOutput, Duration } from 'aws-cdk-lib';
import { Bucket, BucketEncryption, CfnBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class BucketWithEventBridge extends Construct {
  public bucket: Bucket;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.bucket = new Bucket(this, 'Bucket', {
      encryption: BucketEncryption.S3_MANAGED,
      versioned: true,
      lifecycleRules: [
        {
          noncurrentVersionExpiration: Duration.days(60),
        },
      ],
    });

    const cfnBucket = this.bucket.node.defaultChild as CfnBucket;
    cfnBucket.addPropertyOverride(
      'NotificationConfiguration.EventBridgeConfiguration.EventBridgeEnabled',
      'true'
    );

    new CfnOutput(this, 'ConfigBucket', {
      value: this.bucket.bucketName,
    });
  }
}
