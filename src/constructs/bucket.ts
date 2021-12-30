import { Construct } from 'constructs';
import { CfnOutput } from 'aws-cdk-lib';
import { Bucket, BucketEncryption, CfnBucket } from 'aws-cdk-lib/aws-s3';

export class BucketWithEventBridge extends Construct {
  public bucket: Bucket;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.bucket = new Bucket(this, 'Bucket', {
      encryption: BucketEncryption.S3_MANAGED,
      versioned: true,
    });

    const cfnBucket = this.bucket.node.defaultChild as CfnBucket;
    cfnBucket.addPropertyOverride(
      'EventBridgeConfiguration.EventBridgeEnabled',
      'true'
    );

    new CfnOutput(this, 'bucketWebsiteUrl', {
      value: this.bucket.bucketName,
    });
  }
}
