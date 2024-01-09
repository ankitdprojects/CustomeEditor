import React, { useState, useEffect } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, CompositeDecorator, ContentState, Modifier } from 'draft-js';
import 'draft-js/dist/Draft.css';
import './CustomEditor.css';
import { CrossIcon } from '../../assets/svg/Cross';

const redLineDecorator = {
  strategy: (contentBlock, callback) => {
    contentBlock.findStyleRanges(
      (character) => character.hasStyle('REDLINE'),
      callback
    );
  },
  component: (props) => <span className="text-red-500">{props.children}</span>,
};

const compositeDecorator = new CompositeDecorator([redLineDecorator]);

const CustomEditor = () => {
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
      const contentState = convertFromRaw(JSON.parse(savedContent));
      return EditorState.createWithContent(contentState, compositeDecorator);
    }
    return EditorState.createEmpty(compositeDecorator);
  });
  const selection = editorState.getSelection();
  const contentState = editorState.getCurrentContent();
  const currentBlock = contentState.getBlockForKey(selection.getStartKey());
  const lineText = currentBlock.getText();


  useEffect(() => {
    if (lineText.startsWith('# ') && selection.getStartOffset() === 2) {

      const updatedContentState = ContentState.createFromBlockArray(
        contentState.getBlockMap().toArray().map((block) => {
          if (block.getKey() === currentBlock.getKey()) {
            return block.merge({
              text: block.getText().substring(2),
            });
          }
          return block;
        })
      );
    
      const newEditorState = RichUtils.toggleBlockType(
        EditorState.push(editorState, updatedContentState),
        'header-one'
      );

      const updatedSelection = newEditorState.getSelection().merge({
        anchorOffset: lineText.length - 2, 
        focusOffset: lineText.length - 2,
      });
    
      setEditorState(EditorState.forceSelection(newEditorState, updatedSelection));
    
    }else if (lineText.startsWith('** ') && selection.getStartOffset() === 3) {
      const startOffset = selection.getStartOffset();
      const endOffset = selection.getEndOffset();
      const beforeSelection = lineText.slice(0, startOffset);
      const afterSelection = lineText.slice(endOffset);

      const wordStartIndex = beforeSelection.lastIndexOf('**');

      const wordEndIndex = afterSelection.indexOf(' ');
      const removedStarsText = lineText.slice(wordStartIndex + 2);
      const newLineText = ` ${removedStarsText}`;
      const newDataState = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: wordStartIndex,
          focusOffset: startOffset,
        }),
        newLineText
      );

      const newContentState = Modifier.applyInlineStyle(
        newDataState,
        selection.merge({
          anchorOffset: wordStartIndex,
          focusOffset: endOffset + wordEndIndex,
        }),
        'REDLINE'
      );


      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        'change-inline-style'
      );


      const updatedSelection = newEditorState.getSelection().merge({
        anchorOffset: wordStartIndex,
        focusOffset: startOffset + wordEndIndex,
      });

      setEditorState(EditorState.forceSelection(newEditorState, updatedSelection));

    } else if (lineText.startsWith('*** ') && selection.getStartOffset() === 4) {
      const startOffset = selection.getStartOffset();
      const beforeSelection = lineText.slice(0, startOffset);

      const wordStartIndex = beforeSelection.lastIndexOf('***');
      const removedStarsText = lineText.slice(wordStartIndex + 3);

      const newLineText = ` ${removedStarsText}`;
      const newDataState = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: wordStartIndex,
          focusOffset: startOffset,
        }),
        newLineText
      );

      const newContentState = Modifier.applyInlineStyle(
        newDataState,
        selection.merge({
          anchorOffset: wordStartIndex,
          focusOffset: wordStartIndex + removedStarsText.length + 1,
        }),
        'UNDERLINE'
      );

      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        'change-inline-style'
      );

      const updatedSelection = newEditorState.getSelection().merge({
        anchorOffset: wordStartIndex + 1,
        focusOffset: wordStartIndex + removedStarsText.length + 1,
      });

      setEditorState(EditorState.forceSelection(newEditorState, updatedSelection));

    }
    else if (lineText.startsWith('* ') && selection.getStartOffset() === 2) {
      const startOffset = selection.getStartOffset();
      const beforeSelection = lineText.slice(0, startOffset);

      const wordStartIndex = beforeSelection.lastIndexOf('*');
      const removedStarsText = lineText.slice(wordStartIndex + 1);

      const newLineText = ` ${removedStarsText}`;
      const newDataState = Modifier.replaceText(
        contentState,
        selection.merge({
          anchorOffset: wordStartIndex,
          focusOffset: startOffset,
        }),
        newLineText
      );

      const newContentState = Modifier.applyInlineStyle(
        newDataState,
        selection.merge({
          anchorOffset: wordStartIndex,
          focusOffset: wordStartIndex + removedStarsText.length + 1,
        }),
        'BOLD'
      );

      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        'change-inline-style'
      );

      const updatedSelection = newEditorState.getSelection().merge({
        anchorOffset: wordStartIndex + 1,
        focusOffset: wordStartIndex + removedStarsText.length + 1,
      });

      setEditorState(EditorState.forceSelection(newEditorState, updatedSelection));

    }




  }, [lineText])



  const handleSaveClick = () => {
    const contentState = editorState.getCurrentContent();
    const contentJSON = JSON.stringify(convertToRaw(contentState));
    localStorage.setItem('editorContent', contentJSON);
  };
const removeDataFromLocal = () => {
  localStorage.removeItem('editorContent')
  window.location.reload()

}
  return (
    <div className='w-full   border-gray-500	 bg-gradient-to-r from-teal-400 via-orange-300 to-slate-400'>
      <div className='flex justify-between items-center drop-shadow border-b px-10  bg-gradient-to-br h-16 from-pink-100 via-blue-200  to-yellow-500 px-5'>
        <h1 className='text-2xl font-bold text-center text-black flex items-center w-full justify-center'>Created by Ankit Dhanotiya</h1>

        <button className='bg-gradient-to-tl from-yellow-600 via-stone-300 to-indigo-300 text-black border-black w-32 h-10 rounded focus:outline-none focus:ring focus:border-blue-300 active:bg-yellow-600 active:from-indigo-500 active:to-stone-500 ' onClick={handleSaveClick}>
          Save
        </button>
      </div>

      <div className='w-full h-screen px-5  pt-5'>


        <div className='border border-black h-4/6  w-full text-black pl-1'>
          <Editor
            editorState={editorState}
            onChange={setEditorState}
          />
        </div>
        <span className='flex flex-col justify-center items-center mt-2'>
          <button onClick={removeDataFromLocal} className=' active:border-dashed active:border-2 active:border-red-500 rounded'>
            <CrossIcon />
      
          </button>
          <h2 className='bg-red-600 rounded px-5 text-white'>Only click if you want to clear all the data from Text editor as well as local storage</h2>
        </span>
      </div>
    </div>
  );
};

export default CustomEditor;
