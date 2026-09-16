import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// 메일 HTML에 유저 입력값(이름, 조직명 등)을 넣기 전 XSS 방지용 이스케이프 처리
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

type SendInvitationEmailParams = {
  to: string;
  name: string;
  organizationName: string;
  inviterName: string;
  token: string;
};

export async function sendInvitationEmail({
  to,
  name,
  organizationName,
  inviterName,
  token,
}: SendInvitationEmailParams): Promise<void> {
  const inviteUrl = `${process.env.CLIENT_URL}/invite/signup?token=${token}`;

  await transporter.sendMail({
    from: `"${organizationName}" <${process.env.GMAIL_USER}>`,
    to,
    subject: `[${organizationName}] 간식대장(SNACK) 초대가 도착했습니다`,
    html: `
      <p>안녕하세요, ${escapeHtml(name)}님.</p>
      <p>${escapeHtml(organizationName)}의 ${escapeHtml(inviterName)}님이 간식대장(SNACK)에 초대했습니다.</p>
      <p>아래 링크를 클릭해 가입을 완료해주세요. (7일 이내 유효)</p>
      <p><a href="${inviteUrl}">가입하기</a></p>
    `,
  });
}

type SendPasswordResetEmailParams = {
  to: string;
  name: string;
  token: string;
};

// TODO: "본인이 요청한 게 아님" 버튼(토큰 즉시 무효화 기능)을 추가하게 되면,
// 아래 html의 마지막 문구("본인이 요청하지 않았다면...")를
// "이 요청을 하지 않으셨다면 [여기]를 눌러 즉시 무효화해주세요" 형태로 수정 필요함.
export async function sendPasswordResetEmail({
  to,
  name,
  token,
}: SendPasswordResetEmailParams): Promise<void> {
  const resetUrl = `${process.env.CLIENT_URL}/password-reset?token=${token}`;

  await transporter.sendMail({
    from: `"간식대장(SNACK)" <${process.env.GMAIL_USER}>`,
    to,
    subject: '[간식대장(SNACK)] 비밀번호 재설정 안내',
    html: `
      <p>안녕하세요, ${escapeHtml(name)}님.</p>
      <p>비밀번호 재설정을 요청하셨습니다.</p>
      <p>아래 링크를 클릭해 새 비밀번호를 설정해주세요. (30분 이내 유효)</p>
      <p><a href="${resetUrl}">비밀번호 재설정하기</a></p>
      <p>본인이 요청하지 않았다면 이 메일을 무시해도 안전합니다.</p>
    `,
  });
}
