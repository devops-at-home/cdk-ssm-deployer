import { NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { BucketWithEventBridge } from '../constructs/config-bucket';
import { VaultDynamoDB } from '../constructs/vault-dynamodb';
import { GitHubActionsOidcProvider } from '../constructs/gh-aws-oidc-connect-provider';
import { GitHubActionsRole } from '../constructs/gh-aws-oidc-connect-role';
import { PolicyDocument, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { KmsKey } from '../constructs/kms-key';
import { Key } from 'aws-cdk-lib/aws-kms';

const repository = 'devops-at-home/cdk-ssm-deployer';
const destinations: string[] = [];

export class SharedInfraStack extends NestedStack {
  public bucket: Bucket;
  public table: Table;
  public key: Key;
  constructor(scope: Construct, id: string, props: NestedStackProps = {}) {
    super(scope, id, props);

    // TODO: SSM document for running deployments

    const { bucket } = new BucketWithEventBridge(this, 'Bucket');
    this.bucket = bucket;

    const { table } = new VaultDynamoDB(this, 'VaultDynamoDB');
    this.table = table;

    const { key } = new KmsKey(this, 'KmsKey');
    this.key = key;

    new GitHubActionsOidcProvider(this, 'GitHubActionsOidcProvider');

    new GitHubActionsRole(this, 'GitHubActionsRole', {
      provider: GitHubActionsOidcProvider.forAccount(),
      repository,
      inlinePolicies: {
        s3: new PolicyDocument({
          statements: [
            new PolicyStatement({
              resources: [`${bucket.bucketArn}/*`],
              actions: ['s3:PutObject'],
              conditions: {
                StringEquals: {
                  's3:prefix': destZips(destinations),
                },
              },
            }),
          ],
        }),
      },
    });
  }
}

const destZips = (destinations: string[]) => {
  return destinations.map((dest) => {
    return `${dest}.zip`;
  });
};
