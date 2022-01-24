import { NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SSMDeployment } from '../constructs/ssm-deployment';

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
    // - DynamoDB permissions for Vault: https://www.vaultproject.io/docs/configuration/storage/dynamodb

    new SSMDeployment(this, `SSMDeployment-${destination}`, {
      bucketName,
      destination,
    });
  }
}
