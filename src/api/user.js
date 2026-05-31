import api from "./client";

// 내 프로필 조회 GET url: /user/profile
export function fetchMyProfile() {
  return api.get("/user/profile");
}

// 내 프로필 수정 PATCH url: /user/profile
// data : {nickname, phone}
export function updateProfile(data) {
  return api.patch("/user/profile", data);
}

// 회원 탈퇴 DELETE url: /user/profile
// password 는 body로 보냄
export function deleteAccount(password) {
  return api.delete("/user/profile", { data: { password } });
}

// 비밀번호 변경 PUT url: /user/profile/password
// payload: {currentPassword, newPassword }
export function changePassword(payload) {
  return api.put("/user/profile/password", payload);
}

//프로필 사진 업로드 POST url: /user/profile
export function uploadProfileImage(imageFile) {
  const formData = new FormData();
  formData.append("profileImage", imageFile, imageFile.name);
  return api
    .post("/user/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => {
      //return res.data.data.profileUrl
      return res.data.data;
    })
    .then((res) => {
      return res.data.data.profileUrl;
    });
}

//내 경로 목록 GET url: /user/profile/plans
export function fetchMyPlans() {
  return api.get("/user/profile/plans");
}
