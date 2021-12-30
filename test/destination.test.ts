import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { SSMDestination } from '../src/constructs/destination';

test('Snapshot - destination', () => {
  const stack = new Stack();
  new SSMDestination(stack, 'SSMDestination', {
    bucketName: 'someName',
    destination: 'h6060-001',
  });

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});
