import { FunctionComponent, useCallback, useState } from 'react';
import { WarningAlert } from 'components/atoms/WarningAlert';
import { isValidDate } from '../../../utils/is-valid-date';
import { formatDate } from '../../../utils/format-date';
import { DataField } from 'components/molecules/DataField/DataField';
import { State } from '../../../enums';
import { IInfoProps } from 'components/organisms/Subject/interfaces';
import { DetailsGrid } from 'components/molecules/DetailsGrid/DetailsGrid';
import { toStartCase } from '../../../utils/to-start-case/to-start-case';
import { camelCaseToSpace } from '../../../utils/camel-case-to-space/camel-case-to-space';
import { isNullish } from '../../../utils/is-nullish/is-nullish';
import { createArrayOfNumbers } from '../../../utils/create-array-of-numbers/create-array-of-numbers';
import { ctw } from '../../../utils/ctw/ctw';
import { Modal } from 'components/organisms/Modal/Modal';
import { useToggle } from 'hooks/useToggle/useToggle';

export const useInfo = ({
  whitelist = [],
  info,
  isLoading,
}: {
  whitelist: Array<string>;
  info: Record<PropertyKey, unknown>;
  isLoading?: boolean;
}) => {
  const [isOcrMismatch, setIsOcrMismatch] = useState(true);
  const onOcrMismatch = useCallback(() => setIsOcrMismatch(prev => !prev), []);
  const skeletons = createArrayOfNumbers(2);
  const sections = isLoading
    ? skeletons
    : whitelist?.reduce((acc, key) => {
        const section = info[key] ?? {};

        // Don't render sections with no title
        if (Object.keys(section).length === 0) return acc;

        const data = Object.entries(section).reduce((acc, [key, value]) => {
          // Don't render empty fields
          if (isNullish(value) || value === '') return acc;

          acc[key] = value;

          return acc;
        }, {});

        // Don't render sections with a title but no fields
        if (Object.values(data).length === 0) return acc;

        acc.push({
          title: toStartCase(camelCaseToSpace(key)),
          data,
        });

        return acc;
      }, []) ?? [];
  const [
    isViewFullReportModalOpen,
    toggleIsViewFullReportModalOpen,
    toggleOnIsViewFullReportModalOpen,
  ] = useToggle();
  const onToggleOnIsViewFullReportOpen = useCallback(() => {
    toggleOnIsViewFullReportModalOpen();
  }, [toggleOnIsViewFullReportModalOpen]);

  return {
    sections,
    skeletons,
    isOcrMismatch,
    onOcrMismatch,
    onToggleOnIsViewFullReportOpen,
    isViewFullReportModalOpen,
    toggleIsViewFullReportModalOpen,
  };
};

/**
 * @description To be used by {@link Subject}, and be wrapped by {@link Subject.Content}. Displays a single end user's personal information and verification status using {@link DetailsGrid} and {@link DataField}.
 *
 * @see {@link DetailsGrid}
 * @see {@link DataField}
 *
 * @param props
 * @param props.personalInfo - Information such as first name, email, phone.
 * @param props.passportInfo - Contains the passport type, issue date, etc.
 * @param props.checkResults - The verification status of the end user (i.e rejected, approved, pending).
 *
 * @constructor
 */
export const Info: FunctionComponent<IInfoProps> = ({
  info,
  whitelist,
  isLoading,
}) => {
  const {
    sections,
    skeletons,
    isOcrMismatch,
    onOcrMismatch,
    isViewFullReportModalOpen,
    onToggleOnIsViewFullReportOpen,
    toggleIsViewFullReportModalOpen,
  } = useInfo({
    info,
    whitelist,
    isLoading,
  });

  return (
    <div className={`space-y-8 p-4`}>
      {isLoading
        ? skeletons.map(index => (
            <DetailsGrid
              key={`details-grid-skeleton-${index}`}
              title={''}
              data={{}}
              loading={{
                title: true,
                data: true,
              }}
            >
              {() => null}
            </DetailsGrid>
          ))
        : sections?.map(section => (
            <DetailsGrid
              key={section?.title}
              title={section?.title}
              data={section?.data}
              footer={
                /personal\sinfo/i.test(section?.title) && (
                  // Can use dialog here once browser support is better
                  <WarningAlert
                    isOpen={isOcrMismatch}
                    className={`text-base-content theme-dark:text-base-100`}
                  >
                    <div className={`flex w-full justify-between`}>
                      OCR & Given details mismatch
                      <button
                        className={`link-hover link rounded-md p-1`}
                        onClick={onOcrMismatch}
                      >
                        Resolve
                      </button>
                    </div>
                  </WarningAlert>
                )
              }
            >
              {({ title, text, index }) => {
                const value = isValidDate(text)
                  ? formatDate(new Date(text))
                  : text;
                const isCheckResults = /check\sresults/i.test(section?.title);
                const isEmail = /email/i.test(title);

                if (index === 2 && isCheckResults) {
                  return (
                    <>
                      <Modal
                        title={`View full report modal`}
                        isOpen={isViewFullReportModalOpen}
                        onIsOpenChange={toggleIsViewFullReportModalOpen}
                        hideTitle
                      >
                        <pre
                          className={`mx-auto w-full max-w-4xl rounded-md bg-base-content p-4 text-base-100`}
                        >
                          <code>
                            {JSON.stringify(
                              sections?.reduce((acc, curr) => {
                                // Convert titles back to camelCase from Start case.
                                const title = curr?.title
                                  ?.toLowerCase()
                                  ?.replace(/\s[a-z]/g, match =>
                                    match?.toUpperCase()?.replace(/\s/, ''),
                                  );

                                acc[title] = curr?.data;

                                return acc;
                              }, {}),
                              null,
                              2,
                            )}
                          </code>
                        </pre>
                      </Modal>
                      <button
                        className={`link-hover link-primary link rounded-md`}
                        onClick={onToggleOnIsViewFullReportOpen}
                      >
                        View full report
                      </button>
                    </>
                  );
                }

                return (
                  <DataField
                    title={title}
                    text={value}
                    textProps={{
                      className: ctw({
                        capitalize: !isEmail,
                        'normal-case': isEmail,
                        'text-success':
                          isCheckResults && text === State.APPROVED,
                        'text-error': isCheckResults && text === State.REJECTED,
                      }),
                    }}
                  />
                );
              }}
            </DetailsGrid>
          ))}
    </div>
  );
};
