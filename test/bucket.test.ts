import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { BucketWithEventBridge } from '../src/constructs/bucket';

test('Snapshot - bucket', () => {
  const stack = new Stack();
  new BucketWithEventBridge(stack, 'BucketWithEventBridge');

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});
