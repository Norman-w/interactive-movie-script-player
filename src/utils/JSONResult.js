// import PropTypes from 'prop-types';
import styles from './JSONResult.scss';
import JSONTree from 'react-json-tree';
import theme from './JSONResultTheme';

function JSONResult({ json }) {
    console.log(JSON.stringify(json));
    return (
        <div className={styles.testResult}>
            <div className={styles.inner}>
                {json ? (
                    <JSONTree
                        data={json}
                        theme={theme}
                        shouldExpandNode={() => {
                            return false;
                        }}
                    />
                ) : (
                    ''
                )}
            </div>
        </div>
    );
}
export default JSONResult;
