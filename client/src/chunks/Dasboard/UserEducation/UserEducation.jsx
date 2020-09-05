import React from 'react';
import './UserEducation.css';

const UserEducation = (props) => {
    if(props.education){
        const mapEdu = props.education.map((edu, index) => {
            return(
                <li key={index} className="edu-item">
                    <div className="edu-date"><div className="date-item">{edu.from && (<span className="from">{edu.from}</span>)}{edu.to ? <span className="to">&nbsp;-&nbsp;{edu.to}</span> : <span className="current">&nbsp;-&nbsp;По настоящее время</span> }</div></div>
                    { edu.degree && (<div className="edu-degree"><h3>{edu.degree}</h3></div>)}
                    { edu.school && (<div className="edu-school"><h4>{edu.school}</h4></div>)}
                    { edu.fieldofstudy && (<div className="edu-fieldofstudy"><p>{edu.fieldofstudy}</p></div>)}
                    { edu.description && (<div className="edu-description"><p>{edu.description}</p></div>)}
                    <button onClick={() => props.deleteEducation(edu._id)} className="edu-del-btn" title="Удалить"><span className="icon icon-trash" /></button>
                </li>
            );
        });
        return(
            <div className="dash-edu">
                <div className="profile-title"><h2>Дипломы и курсы</h2></div>
                <ul className="edu-list">{mapEdu}</ul>
            </div>
        );
    } else { return ''; }
};
export default UserEducation