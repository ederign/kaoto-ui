import { updateYAML, useStepsAndViewsContext, useYAMLContext } from '../api';
import usePrevious from '../utils/usePrevious';
import { StepErrorBoundary } from './StepErrorBoundary';
import Editor from '@monaco-editor/react';
import { useEffect, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

const YAMLEditor = () => {
  const editorRef = useRef(null);
  const [YAMLData, setYAMLData] = useYAMLContext();
  const [, dispatch] = useStepsAndViewsContext();
  const previousYaml = usePrevious(YAMLData);

  /**
   * On first page load
   * issue request to API for Visualization JSON
   */
  useEffect(() => {
    if (previousYaml === YAMLData) {
      return;
    }

    // TODO: This is a temporary measure to initially load YAML data
    updateYAML(YAMLData)
      .then((res) => {
        // update Visualization with new data
        dispatch({ type: 'UPDATE_INTEGRATION', payload: res });
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  /**
   * On detected changes to YAML state, issue POST to external endpoint
   * Returns JSON to be displayed in the visualizer
   */
  const handleChanges = (incomingData: string) => {
    // Wait a bit before setting data
    setTimeout(() => {
      // Check that the data has changed, otherwise return
      if (previousYaml === incomingData) {
        return;
      }

      setYAMLData(incomingData);

      updateYAML(incomingData)
        .then((res) => {
          // update Visualization with new data
          dispatch({ type: 'UPDATE_INTEGRATION', payload: res });
        })
        .catch((e) => {
          console.error(e);
        });
    }, 750);
  };

  function handleEditorChange(value?: string) {
    debounced(value);
  }

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor;
  }

  function handleEditorValidation(markers: any[]) {
    // Model Markers
    markers.forEach((marker) => console.log('onValidate: ', marker.message));
  }

  const debounced = useDebouncedCallback((value?: string) => {
    if (value) {
      handleChanges(value);
    }
  }, 800);

  return (
    <StepErrorBoundary>
      <Editor
        height="90vh"
        defaultLanguage="yaml"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        onValidate={handleEditorValidation}
        theme={'vs-dark'}
        value={YAMLData}
        className={'code-editor'}
      />
    </StepErrorBoundary>
  );
};

export { YAMLEditor };
