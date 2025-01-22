import React from 'react';

function TestComponent() {
    // Test component to trigger the frontend agent
    const [count, setCount] = React.useState(0);

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                Increment
            </button>
        </div>
    );
}

export default TestComponent;
