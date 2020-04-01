export const approveUserAdminTemplate = `
  You have approved <b>{{username}}</b> in Lynksin-Golf at {{createdAt}}<br/><br/>Thanks,<br/>Lynksin Golf Team</p>. 
`;

export const approveUserTemplate = `
<p>Hi <strong>Golfer</strong>, <br/><br/>Welcome to LynksIn-Golf!!. <br/><br/>Your account has been approved. Please sign up in the app to continue.<br/>
<br>Username - {{useremail}}<br>Code - {{code}}<br/><br/>Thanks,<br/>Lynksin Golf Team</p>
`;

export const rejectUserAdminTemplate = `
  You have rejected <b>{{username}}</b> in Lynksin-Golf at {{createdAt}}<br/><br/>Thanks,<br/>Lynksin Golf Team</p>. 
`;

export const rejectedUserTemplate = `
<p>Hi <strong>{{username}}</strong>, <br/><br/>Your account has been rejected by the admin.<br/>
<br>Username - {{useremail}}<br/><br/>Thanks,<br/>Lynksin Golf Team</p>
`;
