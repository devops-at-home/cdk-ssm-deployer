import { CfnOutput } from 'aws-cdk-lib';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';

export class KmsKey extends Construct {
  public key: Key;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.key = new Key(this, 'Key');

    new CfnOutput(this, 'Output', {
      value: this.key.keyId,
    });
  }
}
