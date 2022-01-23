import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { BucketWithEventBridge } from '../src/constructs/config-bucket';

describe('BucketWithEventBridge', () => {
  const stack = new Stack();
  new BucketWithEventBridge(stack, 'BucketWithEventBridge');
  const template = Template.fromStack(stack);

  test('Config', () => {
    template.resourceCountIs('AWS::S3::Bucket', 1);
    template.hasResourceProperties('AWS::S3::Bucket', {
      EventBridgeConfiguration: { EventBridgeEnabled: 'true' },
      VersioningConfiguration: {
        Status: 'Enabled',
      },
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: 'AES256',
            },
          },
        ],
      },
    });
  });

  test('Snapshot', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });
});
