angular.module('financier').factory('User', $http => {
  return {
    create: (email, password) => {
      return $http.post('/manage/users', {
        email,
        password
      })
      .then(d => d.data);
    },
    login: (email, password) => {
      return $http.post('/db/_session', {
        name: email,
        password
      })
      .then(d => d.data);
    },
    logout: () => {
      return $http.delete('/db/_session')
      .then(d => d.data);
    },
    session: () => {
      return $http.get('/db/_session')
      .then(d => d.data);
    }
  };
});
