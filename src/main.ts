import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SharedInfraStack } from './stacks/shared-infra';
import { DestinationStack } from './stacks/destination';

type Params = {
  destinations: string[];
  githubOrg: string;
};

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    // Load params
    const params: Params = this.node.tryGetContext('params');

    // Create shared infra
    const { bucket, table, key } = new SharedInfraStack(
      this,
      'SharedInfraStack',
      { ...params }
    );
    const { bucketName } = bucket;
    const { tableName } = table;
    const { keyArn } = key;

    // TODO: SSM Document for downloading package to temp folder and running script

    params.destinations.forEach((destination) => {
      new DestinationStack(this, `DestinationStack-${destination}`, {
        bucketName,
        tableName,
        destination,
        keyArn,
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
