import { NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SSMRole } from '../constructs/ssm-role';
// import { SSMDeployment } from '../constructs/ssm-deployment';

interface DestinationStackProps extends NestedStackProps {
  bucketName: string;
  tableName: string;
  destination: string;
}

export class DestinationStack extends NestedStack {
  constructor(scope: Construct, id: string, props: DestinationStackProps) {
    super(scope, id, props);

    const { bucketName, tableName, destination } = props;

    new SSMRole(this, 'Role', {
      destination,
      bucketName,
      tableName,
    });

    // new SSMDeployment(this, 'Deployment', {
    //   bucketName,
    //   destination,
    // });
  }
}
