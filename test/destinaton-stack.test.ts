import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DestinationStack } from '../src/stacks/destination';

describe('DestinationStack', () => {
  const stack = new Stack();
  const nestedStack = new DestinationStack(stack, 'DestinationStack', {
    bucketName: 'bucketName',
    tableName: 'tableName',
    destination: 'h6060-001',
  });

  const template = Template.fromStack(nestedStack);

  test('Snapshot', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });
});
