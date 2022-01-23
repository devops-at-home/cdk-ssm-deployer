import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SharedInfraStack } from './stacks/shared-infra';
import { DestinationStack } from './stacks/destination';

type Params = {
  destinations: string[];
};

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    // Load params
    const params: Params = this.node.tryGetContext('params');
    const { destinations } = params;

    // Create shared infra
    const { bucket, table } = new SharedInfraStack(this, 'SharedInfraStack');
    const { bucketName } = bucket;
    const { tableName } = table;

    // TODO: SSM Document for downloading package to temp folder and running script

    destinations.forEach((destination) => {
      new DestinationStack(this, `DestinationStack-${destination}`, {
        bucketName,
        tableName,
        destination,
      });
    });
  }
}

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'ssm-deployer', { env });

app.synth();
