import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";

type PasswordResetEmailProps = {
    name: string;
    resetLink: string;
};

export function PasswordResetEmail({ name, resetLink }: PasswordResetEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Reset your password</Preview>
            <Body style={{ backgroundColor: "#f4f4f5", fontFamily: "sans-serif" }}>
                <Container style={{ maxWidth: "480px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "8px", padding: "32px" }}>
                    <Heading style={{ fontSize: "20px", color: "#111827" }}>
                        Password reset request
                    </Heading>
                    <Text style={{ color: "#374151" }}>
                        Hi {name}, we received a request to reset your password. Click the button below — this link expires in 30 minutes.
                    </Text>
                    <Section style={{ textAlign: "center", margin: "24px 0" }}>
                        <Button
                            href={resetLink}
                            style={{ backgroundColor: "#111827", color: "#ffffff", padding: "12px 24px", borderRadius: "6px", textDecoration: "none", fontSize: "14px" }}
                        >
                            Reset password
                        </Button>
                    </Section>
                    <Text style={{ color: "#6b7280", fontSize: "13px" }}>
                        If you didn't request this, you can safely ignore this email.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}
