import { Handler, EventBridgeEvent, Context } from 'aws-lambda';

export const handler: Handler = async (
  event: EventBridgeEvent<any, any>,
  context: Context
) => {
  console.log(JSON.stringify(event));
  console.log(JSON.stringify(context));

  /* {
    currentVer: '',
    nextVer: {
      major: '',
      minor: '',
      patch: ''
    }
  }
  */
};
