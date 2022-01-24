import { Construct } from 'constructs';
import { Rule } from 'aws-cdk-lib/aws-events';
import { AwsApi } from 'aws-cdk-lib/aws-events-targets';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

type SSMDeploymentProps = {
  bucketName: string;
  destination: string;
};

export class SSMDeployment extends Construct {
  constructor(scope: Construct, id: string, props: SSMDeploymentProps) {
    super(scope, id);

    const { bucketName, destination } = props;

    const s3BucketRule = new Rule(this, 'Rule', {
      ruleName: `deployTrigger-${destination}`,
      eventPattern: {
        source: ['aws.s3'],
        detail: {
          eventSource: ['s3.amazonaws.com'],
          eventName: ['PutObject'],
          requestParameters: {
            bucketName,
            key: `${destination}.zip`,
          },
        },
      },
    });

    const policyStatement = new PolicyStatement({
      actions: ['ssm:*'],
      resources: ['*'],
    });

    // TODO: Invoke deployments documents to add and remove workloads when config added or removed from S3

    const ssmApiAction = new AwsApi({
      action: 'action',
      service: 'service',
      apiVersion: 'apiVersion',
      catchErrorPattern: 'catchErrorPattern',
      parameters: { destination },
      policyStatement,
    });

    s3BucketRule.addTarget(ssmApiAction);
  }
}
