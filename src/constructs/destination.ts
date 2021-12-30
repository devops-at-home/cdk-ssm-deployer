import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Rule } from 'aws-cdk-lib/aws-events';
import { AwsApi } from 'aws-cdk-lib/aws-events-targets';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

type SSMDestinationProps = {
  bucketName: string;
  destination: string;
};

export class SSMDestination extends Construct {
  constructor(scope: Construct, id: string, props: SSMDestinationProps) {
    super(scope, id);

    const { bucketName, destination } = props;

    new NodejsFunction(this, 'Lambda', {
      functionName: `deployer-${destination}-get-current-version`,
    });

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

    const ssmApiAction = new AwsApi({
      action: 'action',
      service: 'service',
      apiVersion: 'apiVersion',
      catchErrorPattern: 'catchErrorPattern',
      parameters: { destination },
      policyStatement,
    });

    s3BucketRule.addTarget(ssmApiAction);

    // TODO: OIDC permissions for git repo
    // - write to bucket folder (zip only)
    // - invoke version lambda (is it possible to restrict input params) -> only way to do this is a lambda per destination

    // TODO: ssm role and permissions to
    // - read from bucket folder
    // - invoke version lambda
    // - trigger deployment

    // TODO: custom resource to create destination folder in bucket
  }
}
