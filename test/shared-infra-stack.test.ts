import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { SharedInfraStack } from '../src/stacks/shared-infra';

describe('SharedInfraStack', () => {
  const stack = new Stack();
  const nestedStack = new SharedInfraStack(stack, 'SharedInfraStack');
  const template = Template.fromStack(nestedStack);

  test('Bucket', () => {
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
