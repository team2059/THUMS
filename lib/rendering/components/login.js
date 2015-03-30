/* global XMLHttpRequest: true */
var React = require('react');

module.exports = {
    read: React.createClass({
        displayName: 'Login',
        getInitialState: function () {
            'use strict';
            return {
                email: null,
                username: '',
                password: ''
            };
        },
        handleChange: function (event) {
            'use strict';
            if (event.target.id === 'username-input') {
                this.setState({username: event.target.value});
            } else if (event.target.id === 'password-input') {
                this.setState({password: event.target.value});
            } else if (event.target.id === 'email-input') {
                this.setState({email: event.target.value});
            }
        },
        onSubmit: function (event) {
            'use strict';
            event.preventDefault();
            console.log(this.state);
            var request = new XMLHttpRequest();
            request.onload = function () {
                console.log(this.responseText);
            };
            request.open('post', '/api/admin/login', true);
            request.setRequestHeader('Content-type', 'application/json');
            request.send(JSON.stringify(this.state));
        },
        render: function () {
            'use strict';
            var email_input;
            if (this.props.data.content.register) {
                email_input = React.createElement('div', null,
                    React.createElement('label', {
                        htmlFor: 'email-input'
                    }, 'E-mail'),
                    React.createElement('input', {
                        id: 'email-input',
                        value: this.state.email,
                        onChange: this.handleChange
                    })
                );
            }
            return (
                React.createElement('div', null,
                    React.createElement('h1', null, this.props.data.title),
                    React.createElement('form', {
                            className: 'section-content',
                            onSubmit: this.onSubmit
                        },
                        email_input,
                        React.createElement('label', {
                            htmlFor: 'username-input'
                        }, 'Username'),
                        React.createElement('input', {
                            id: 'username-input',
                            value: this.state.username,
                            onChange: this.handleChange
                        }),
                        React.createElement('label', {
                            htmlFor: 'password-input'
                        }, 'Password'),
                        React.createElement('input', {
                            id: 'password-input',
                            type: 'password',
                            value: this.state.password,
                            onChange: this.handleChange
                        }),
                        React.createElement('button', {
                            onClick: this.onSubmit
                        }, 'Submit')
                    )
                )
            );
        }
    })
};

