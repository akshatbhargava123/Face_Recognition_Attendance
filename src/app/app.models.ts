export interface Student {
    id: string;
    groupId: string;
    name: string;
    photoUrl: string;
    created?: number;
};

export interface StudentGroup {
    id: string;
    userId: string;
    name: string;
    created?: number;
};

export interface Attendance {
    id: string;
    date: string;
    studentId: string;
    studentGroupId: string;
    created?: number;
};

export function generateId() {
    var len = 16;
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charLength = chars.length;
    var result = "";
    let randoms = window.crypto.getRandomValues(new Uint32Array(len));
    for(var i = 0; i < len; i++) {
        result += chars[randoms[i] % charLength];
    }
    return result.toLowerCase();
};

export function dataURItoBlob(dataURI) {
    // code adapted from: http://stackoverflow.com/questions/33486352/cant-upload-image-to-aws-s3-from-ionic-camera
    let binary = atob(dataURI.split(',')[1]);
    let array = [];
    for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
};