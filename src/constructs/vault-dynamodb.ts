import { CfnOutput } from 'aws-cdk-lib';
import {
  AttributeType,
  BillingMode,
  Table,
  TableEncryption,
} from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class VaultDynamoDB extends Construct {
  public table: Table;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.table = new Table(this, 'Table', {
      billingMode: BillingMode.PAY_PER_REQUEST,
      encryption: TableEncryption.AWS_MANAGED,
      partitionKey: {
        name: 'Path',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'Key',
        type: AttributeType.STRING,
      },
    });

    new CfnOutput(this, 'VaultTable', {
      value: this.table.tableName,
    });
  }
}
