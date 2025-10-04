import React from 'react';
import { ComponentData, ActionConfig } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface FilePickerProps {
  component: ComponentData;
  isPreview?: boolean;
}

export const FilePicker: React.FC<FilePickerProps> = ({ component, isPreview = false }) => {
  const props = component.props || {};
  const { components, apis, sqlQueries, runApi, runSqlQuery, updateGlobalState, deleteComponent } = useAppStore();

  if (props.visible === false) return null;
  if (props.disabled && !isPreview) return null;

  const executeAction = async (action: ActionConfig) => {
    if (!action || action.type === 'none') return;

    const exec = async (a: ActionConfig) => {
      switch (a.type) {
        case 'query':
          if (a.target) {
            const apiTarget = apis?.find(x => x.id === a.target);
            const sqlTarget = sqlQueries?.find(x => x.id === a.target);
            if (apiTarget) await runApi(a.target);
            else if (sqlTarget) await runSqlQuery(a.target);
          }
          break;

        case 'js':
          if (a.target) {
            const helpers = { components, apis, sqlQueries, updateGlobalState, runApi, runSqlQuery } as unknown;
            try {
              const fn = new Function('helpers', a.target);
              fn(helpers);
            } catch (err) {
              console.error('Error executing JS action:', err);
            }
          }
          break;

        case 'alert':
          alert(a.params?.message || 'Upload triggered');
          break;

        case 'store':
          if (a.target) updateGlobalState(a.target, a.params?.value ?? null);
          break;

        case 'remove':
          try {
            const targetId = a.target === 'self' || !a.target ? component.id : a.target;
            deleteComponent(targetId);
          } catch (err) {
            console.error('Error deleting component:', err);
          }
          break;

        // other cases intentionally minimal for filepicker
        default:
          break;
      }

      if (a.onSuccess) await exec(a.onSuccess);
    };

    try {
      await exec(action);
    } catch (err) {
      console.error('Action error', err);
      if (action.onFailure) await exec(action.onFailure);
    }
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Optionally store selected files in global state for bindings
    if (props.storeTo) {
      // store a simple metadata list
      const list = Array.from(files).map(f => ({ name: f.name, size: f.size, type: f.type }));
      updateGlobalState(props.storeTo, list);
    }

    // Run onUpload action if provided
    const uploadAction: ActionConfig | undefined = component.events?.['onUpload'];
    if (uploadAction) {
      await executeAction(uploadAction);
    }
  };

  const accept = props.acceptedTypes ? String(props.acceptedTypes) : undefined;

  return (
    <div className="w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
      <label className={`flex items-center gap-2 px-3 py-2 border rounded cursor-pointer bg-gray-700 text-white ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <input
          type="file"
          accept={accept}
          multiple={Boolean(props.multiple)}
          onChange={handleFiles}
          disabled={props.disabled && !isPreview}
          className="hidden"
        />
        <span>{props.label || 'Upload file'}</span>
      </label>
    </div>
  );
};
