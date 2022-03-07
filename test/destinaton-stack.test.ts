import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DestinationStack } from '../src/stacks/destination';

describe('DestinationStack', () => {
  const stack = new Stack();
  const nestedStack = new DestinationStack(stack, 'DestinationStack', {
    bucketName: 'bucketName',
    tableName: 'tableName',
    destination: 'h6060-001',
    keyArn:
      'arn:aws:kms:ap-southeast-1:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab',
    containers: ['hello-kubenetes'],
  });
  const template = Template.fromStack(nestedStack);

  test('Snapshot', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });
});
