import { NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { SSMDeployment } from '../constructs/ssm-deployment';
import { join } from 'path';

interface DestinationStackProps extends NestedStackProps {
  bucketName: string;
  tableName: string;
  destination: string;
}

export class DestinationStack extends NestedStack {
  constructor(scope: Construct, id: string, props: DestinationStackProps) {
    super(scope, id, props);

    const { bucketName, destination } = props;

    // TODO: ssm role and permissions to
    // - read from bucket folder
    // - invoke version lambda
    // - trigger deployment

    new SSMDeployment(this, `SSMDeployment-${destination}`, {
      bucketName,
      destination,
    });

    new BucketDeployment(this, `BucketDeployment-${destination}`, {
      destinationBucket: Bucket.fromBucketName(this, 'DestBucket', bucketName),
      sources: [Source.asset(join(__dirname, '../../../', destination))],
      destinationKeyPrefix: destination,
    });
  }
}
