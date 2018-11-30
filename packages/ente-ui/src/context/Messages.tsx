import { BehaviorSubject, Subscription } from "rxjs";
import * as React from "react";

export const messages$ = new BehaviorSubject<string[]>([]);

export const addMessages = (...msg: string[]) => {
  const currentVal = messages$.getValue();
  const nextVal = [...currentVal, ...msg];
  messages$.next(nextVal);
};

export const removeMessage = (msg: string) => {
  const currentVal = messages$.getValue();
  const nextVal = currentVal.filter(a => a !== msg);
  messages$.next(nextVal);
};

export interface MessagesContextValue {
  messages: string[];
  addMessages: (...msg: string[]) => void;
  removeMessage: (msg: string) => void;
}

export const MessagesContext = React.createContext<MessagesContextValue>({
  addMessages,
  removeMessage,
  messages: messages$.getValue()
});

export const MessagesConsumer = MessagesContext.Consumer;

export class MessagesProvider extends React.PureComponent<
  {},
  { messages: string[] }
> {
  state = {
    messages: messages$.getValue()
  };

  subscription: Subscription;

  componentDidMount() {
    this.subscription = messages$.subscribe(messages =>
      this.setState({ messages })
    );
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    const { children } = this.props;
    const { messages } = this.state;

    return (
      <MessagesContext.Provider
        value={{
          messages,
          addMessages,
          removeMessage
        }}
      >
        {children}
      </MessagesContext.Provider>
    );
  }
}