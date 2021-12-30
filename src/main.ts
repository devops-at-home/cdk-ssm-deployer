import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BucketWithEventBridge } from './constructs/bucket';
import { SSMDestination } from './constructs/destination';

type Params = {
  destinations: string[];
};

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    // Load params
    const params: Params = this.node.tryGetContext('params');
    const { destinations } = params;

    // Create bucket
    const { bucket } = new BucketWithEventBridge(this, 'Bucket');
    const { bucketName } = bucket;

    // TODO: SSM Document for downloading package to temp folder and running script

    destinations.forEach((destination) => {
      new SSMDestination(this, `dest-${destination}`, {
        bucketName,
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
