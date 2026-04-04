import React, { createRef } from "react";
import { TextField } from "@mui/material";

class TamilTextFieldS extends React.Component {
  constructor() {
    super();
    this.state = {
      visible: true,
      inputs: ""
    };
  }

  inputRef = createRef();
  keyboardRef = createRef();

  handleKeyboardChange = (data) => {
    debugger;
    this.setState((inputData) => ({ ...inputData, inputs: data }));
  };

  render() {
    return (
      <>
        {/* Pass all the input field properties same as example to get expected output. This keyboard only applicable for antd input.*/}

        <TextField
          type="text"
          id="virtualkeyID"
          onPaste={(e) => this.keyboardRef.current.handlePaste(e)}
          onKeyPress={(e) => this.keyboardRef.current.keypress(e)}
          onKeyDown={(e) => this.keyboardRef.current.keyup(e)}
          onCut={(e) => this.keyboardRef.current.handleCut(e)}
          onFocus={(e) => [
            this.keyboardRef.current.onfocus(e),
            this.keyboardRef.current.anotherKeyBoardHide([
              "virtualkeyID1",
              "virtualkeyID2",
              "virtualkeyID3"
            ])
          ]}
          value={this.state.inputs}
          ref={this.inputRef}
        />

        
      </>
    );
  }
}
export default TamilTextFieldS;
