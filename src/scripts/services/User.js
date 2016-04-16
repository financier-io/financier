angular.module('financier').factory('User', $http => {
  return {
    create: (email, password) => {
      return $http.post('/manage/users', {
        email,
        password
      });
    }
  };
});
