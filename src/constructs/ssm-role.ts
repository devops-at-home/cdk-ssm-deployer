import { Aws } from 'aws-cdk-lib';
import {
  ManagedPolicy,
  Policy,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

type SSMRoleProps = {
  bucketName: string;
  tableName?: string;
  destination: string;
  keyArn?: string;
};

export class SSMRole extends Construct {
  constructor(scope: Construct, id: string, props: SSMRoleProps) {
    super(scope, id);

    const { bucketName, tableName, destination, keyArn } = props;
    const { REGION, ACCOUNT_ID } = Aws;

    // DynamoDB permissions for Vault:
    // https://www.vaultproject.io/docs/configuration/storage/dynamodb

    const role = new Role(this, 'Role', {
      roleName: `SSMServiceRole-${destination}`,
      assumedBy: new ServicePrincipal('ssm.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
      inlinePolicies: {
        bucket: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['s3:GetObject'],
              resources: [`arn:aws:s3:::${bucketName}/${destination}.zip`],
            }),
          ],
        }),
      },
    });

    if (tableName) {
      role.attachInlinePolicy(
        new Policy(this, 'TablePolicy', {
          policyName: 'table',
          statements: [
            new PolicyStatement({
              actions: [
                'dynamodb:DescribeLimits',
                'dynamodb:DescribeTimeToLive',
                'dynamodb:ListTagsOfResource',
                'dynamodb:DescribeReservedCapacityOfferings',
                'dynamodb:DescribeReservedCapacity',
                'dynamodb:BatchGetItem',
                'dynamodb:BatchWriteItem',
                'dynamodb:DeleteItem',
                'dynamodb:GetItem',
                'dynamodb:GetRecords',
                'dynamodb:PutItem',
                'dynamodb:Query',
                'dynamodb:UpdateItem',
                'dynamodb:Scan',
                'dynamodb:DescribeTable',
              ],
              resources: [
                `arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/${tableName}`,
              ],
            }),
            new PolicyStatement({
              actions: ['dynamodb:ListTables'],
              resources: [`arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/*`],
            }),
          ],
        })
      );
    }

    if (keyArn) {
      role.attachInlinePolicy(
        new Policy(this, 'KeyPolicy', {
          policyName: 'key',
          statements: [
            new PolicyStatement({
              actions: ['kms:Encrypt', 'kms:Decrypt', 'kms:DescribeKey'],
              resources: [keyArn],
            }),
          ],
        })
      );
    }
  }
}
