import React, { useState, useEffect } from 'react';
import '../../styles/ApiDataComponent.css'

const ApiDataComponent = (props) => {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(0);
    const limit = 10; // Adjust the limit as needed

    useEffect(() => {
        fetchData(page);
    }, [page]);

    const fetchData = async (page) => {
        try {
            //const response = await fetch(`https://api.example.com/data?page=${page}&limit=${limit}`);
            const response = await fetch('http://localhost:7087/traceability/products/all?limit='+limit+'&skip='+(page*limit))
            const result = await response.json();
            setData(result); // Adjust based on your API response structure
            //console.log(result);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleNext = () => {
        setPage(page + 1);
        console.log(data.length);
    };

    const handleBack = () => {
        if (page > 0) {
            setPage(page - 1);
            console.log(data);
            console.log(data.length);

        }
    };

    return (
        <div className="digital-product-passport">
            <h2>Digital Product Passport</h2>
            <div className="scrollable-list">
                <ul>
                    {data && data.map((item, index) => (
                        <li key={index} className="fancy-list-item">
                            <a href={`http://example.com/${item}`} target="_blank" rel="noopener noreferrer">
                                [ {item} ]
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="button-container">
                <button onClick={handleBack} disabled={page === 0}>Back</button>
                <button onClick={handleNext} disabled={data.length < limit}>Next</button>
            </div>
        </div>
    );
};

export default ApiDataComponent;


/*
<div>
            <h2>Digital Product Passport</h2>
            <ul>
            {data && data.map((item, index) => (
                    <li key={index}>
                         <a href={`http://example.com/${item}`} target="_blank" rel="noopener noreferrer">[ {item} ]</a>
                    </li>
                ))}
            </ul>
            <div className="button-container">
                <button onClick={handleBack} disabled={page === 0}>Back</button>
                <button onClick={handleNext} disabled={data.length < limit}>Next</button>
            </div>
        </div>
 */