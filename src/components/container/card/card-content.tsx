import * as React from 'react';
import './card-content.css';

export interface CardContentProps {
	style?: object;
}

export const CardContent: React.FC<CardContentProps> = (props) => {
	const {style={}, children}= props;
	return <div className="card-content" style={{...style}}>{children}</div>
}
