import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface SSMDocsStackProps extends StackProps {}

export class SSMDocsStack extends Stack {
    constructor(scope: Construct, id: string, props: SSMDocsStackProps) {
        super(scope, id, props);

        // TODO: SSM document for running deployments
    }
}
