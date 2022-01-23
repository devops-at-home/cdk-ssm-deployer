import { NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { BucketWithEventBridge } from '../constructs/config-bucket';
import { VaultDynamoDB } from '../constructs/vault-dynamodb';

export class SharedInfraStack extends NestedStack {
  public bucket: Bucket;
  public table: Table;
  constructor(scope: Construct, id: string, props: NestedStackProps = {}) {
    super(scope, id, props);

    // TODO: OIDC permissions for git repo

    // TODO: SSM document for running deployments

    const { bucket } = new BucketWithEventBridge(this, 'Bucket');
    this.bucket = bucket;

    const { table } = new VaultDynamoDB(this, 'VaultDynamoDB');
    this.table = table;
  }
}
